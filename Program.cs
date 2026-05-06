using Hangfire;
using Hangfire.Common;
using Hangfire.Dashboard;
using Hangfire.MemoryStorage;
using HotelBookingAPI.Data;
using HotelBookingAPI.Helpers;
using HotelBookingAPI.Jobs;
using HotelBookingAPI.Models.Entities;
using HotelBookingAPI.Services.Implementations;
using HotelBookingAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// 3. JWT
var jwtSecret = builder.Configuration["JwtSettings:Secret"] ?? "YourSuperSecretKeyHereMakeItLong1234567890";
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "HotelBookingAPI";
var jwtAudience = builder.Configuration["JwtSettings:Audience"] ?? "HotelBookingClient";

var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// 4. Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("ReceptionistOrAdmin", policy => policy.RequireRole("Admin", "Receptionist"));
    options.AddPolicy("GuestOrHigher", policy => policy.RequireRole("Admin", "Receptionist", "Guest"));
});

// 5. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// 6. Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IRoomTypeService, RoomTypeService>();
builder.Services.AddScoped<IGuestProfileService, GuestProfileService>();
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<HangfireJobService>();

// ========================
// 🔥 FIXED HANGFIRE (STEP 2)
// ========================
builder.Services.AddHangfire(config =>
    config.UseSimpleAssemblyNameTypeSerializer()
          .UseRecommendedSerializerSettings()
          .UseMemoryStorage());

builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = 1;
});

// Controllers
builder.Services.AddControllers();

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// DB + seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();

    await context.Database.EnsureCreatedAsync();
    await SeedData.Initialize(services);
}

// Recurring jobs
using (var scope = app.Services.CreateScope())
{
    var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();

    recurringJobManager.AddOrUpdate<HangfireJobService>(
        "CancelUnpaidReservations",
        job => job.CancelUnpaidReservationsAsync(),
        Cron.Hourly);
}

// Dashboard
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new Hangfire.Dashboard.LocalRequestsOnlyAuthorizationFilter() }
});


app.Run();
public static class SeedData
{
    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        string[] roles = { "Admin", "Receptionist", "Guest" };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        var existingUser = await userManager.FindByEmailAsync("admin@hotel.com");

        if (existingUser == null)
        {
            var adminUser = new ApplicationUser
            {
                UserName = "admin@hotel.com",
                Email = "admin@hotel.com",
                FullName = "Admin User",
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(adminUser, "Admin123!");

            if (result.Succeeded)
                await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }
}