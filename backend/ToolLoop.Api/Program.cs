
using MongoDB.Bson;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ToolLoop.Api.Models;
using ToolLoop.Api.Repositories;


var builder = WebApplication.CreateBuilder(args);

// ============================================
// RENDER PORT CONFIGURATION
// ============================================

var port = Environment.GetEnvironmentVariable("PORT") ?? "10000";

builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// ============================================
// REGISTER REPOSITORY
// ============================================

builder.Services.AddScoped<IEquipmentRepository, MongoEquipmentRepository>();
builder.Services.AddScoped<IBorrowingRepository, MongoBorrowingRepository>();

// ============================================
// CORS CONFIGURATION
// ============================================

var allowedOrigins = new[]
{
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://tooloop-system.netlify.app"
};

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ============================================
// BUILD APPLICATION
// ============================================

var app = builder.Build();

app.UseCors("AllowFrontend");

// ============================================
// HEALTH CHECK
// Does not connect to MongoDB
// ============================================

app.MapGet("/api/health", () =>
{
    return Results.Ok(new
    {
        status = "ok"
    });
});

app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        status = "ok"
    });
});

// ============================================
// TEST MONGODB CONNECTION
// ============================================

app.MapGet("/api/db-test", async (
    IServiceProvider services,
    ILogger<Program> logger) =>
{
    try
    {
        var repository =
            services.GetRequiredService<IEquipmentRepository>();

        await repository.PingAsync();

        return Results.Ok(new
        {
            status = "Connected",
            database = "toolLoopDb"
        });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "MongoDB connection test failed.");

        return Results.Problem(
            title: "MongoDB connection failed",
            detail: "Check the Render server logs for the actual error.",
            statusCode: 500
        );
    }
});

// ============================================
// GET ALL EQUIPMENT
// ============================================

app.MapGet("/api/equipment", async (
    IEquipmentRepository repository,
    ILogger<Program> logger) =>
{
    try
    {
        var equipment = await repository.GetAllAsync();

        return Results.Ok(equipment);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to retrieve equipment.");

        return Results.Problem(
            title: "Failed to retrieve equipment",
            detail: "An error occurred while retrieving equipment.",
            statusCode: 500
        );
    }
});

// ============================================
// GET EQUIPMENT BY ID
// ============================================

app.MapGet("/api/equipment/{id}", async (
    string id,
    IEquipmentRepository repository,
    ILogger<Program> logger) =>
{
    if (!ObjectId.TryParse(id, out _))
    {
        return Results.BadRequest(new
        {
            message = "Invalid equipment ID."
        });
    }

    try
    {
        var equipment = await repository.GetByIdAsync(id);

        if (equipment == null)
        {
            return Results.NotFound(new
            {
                message = "Equipment not found."
            });
        }

        return Results.Ok(equipment);
    }
    catch (Exception ex)
    {
        logger.LogError(
            ex,
            "Failed to retrieve equipment with ID {EquipmentId}.",
            id
        );

        return Results.Problem(
            title: "Failed to retrieve equipment",
            detail: "An error occurred while retrieving the equipment.",
            statusCode: 500
        );
    }
});

// ============================================
// ADD NEW EQUIPMENT
// ============================================

app.MapPost("/api/equipment", async (
    Equipment equipment,
    IEquipmentRepository repository,
    ILogger<Program> logger) =>
{
    if (string.IsNullOrWhiteSpace(equipment.Name))
    {
        return Results.BadRequest(new
        {
            message = "Equipment name is required."
        });
    }

    if (string.IsNullOrWhiteSpace(equipment.Category))
    {
        return Results.BadRequest(new
        {
            message = "Equipment category is required."
        });
    }

    if (equipment.Quantity < 1)
    {
        return Results.BadRequest(new
        {
            message = "Quantity must be greater than zero."
        });
    }

    try
    {
        equipment.Id = null;
        equipment.AvailableQuantity = equipment.Quantity;

        var savedEquipment = await repository.AddAsync(equipment);

        return Results.Created(
            $"/api/equipment/{savedEquipment.Id}",
            savedEquipment
        );
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to save new equipment.");

        return Results.Problem(
            title: "Failed to save equipment",
            detail: "An error occurred while saving the equipment.",
            statusCode: 500
        );
    }
});

// ============================================
// UPDATE EQUIPMENT
// ============================================

app.MapPut("/api/equipment/{id}", async (
    string id,
    Equipment updatedEquipment,
    IEquipmentRepository repository,
    ILogger<Program> logger) =>
{
    if (!ObjectId.TryParse(id, out _))
    {
        return Results.BadRequest(new
        {
            message = "Invalid equipment ID."
        });
    }

    if (string.IsNullOrWhiteSpace(updatedEquipment.Name))
    {
        return Results.BadRequest(new
        {
            message = "Equipment name is required."
        });
    }

    if (string.IsNullOrWhiteSpace(updatedEquipment.Category))
    {
        return Results.BadRequest(new
        {
            message = "Equipment category is required."
        });
    }

    if (updatedEquipment.Quantity < 1)
    {
        return Results.BadRequest(new
        {
            message = "Quantity must be greater than zero."
        });
    }

    try
    {
        var existingEquipment = await repository.GetByIdAsync(id);

        if (existingEquipment == null)
        {
            return Results.NotFound(new
            {
                message = "Equipment not found."
            });
        }

        var borrowedQuantity =
            existingEquipment.Quantity -
            existingEquipment.AvailableQuantity;

        if (updatedEquipment.Quantity < borrowedQuantity)
        {
            return Results.BadRequest(new
            {
                message = "Quantity cannot be less than the number of borrowed units."
            });
        }

        updatedEquipment.Id = id;

        updatedEquipment.AvailableQuantity =
            updatedEquipment.Quantity - borrowedQuantity;

        var result = await repository.UpdateAsync(id, updatedEquipment);

        if (result == null)
        {
            return Results.NotFound(new
            {
                message = "Equipment not found."
            });
        }

        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        logger.LogError(
            ex,
            "Failed to update equipment with ID {EquipmentId}.",
            id
        );

        return Results.Problem(
            title: "Failed to update equipment",
            detail: "An error occurred while updating the equipment.",
            statusCode: 500
        );
    }
});

// ============================================
// DELETE EQUIPMENT
// ============================================

app.MapDelete("/api/equipment/{id}", async (
    string id,
    IEquipmentRepository repository,
    ILogger<Program> logger) =>
{
    if (!ObjectId.TryParse(id, out _))
    {
        return Results.BadRequest(new
        {
            message = "Invalid equipment ID."
        });
    }

    try
    {
        var deleted = await repository.DeleteAsync(id);

        if (!deleted)
        {
            return Results.NotFound(new
            {
                message = "Equipment not found."
            });
        }

        return Results.Ok(new
        {
            message = "Equipment deleted successfully."
        });
    }
    catch (Exception ex)
    {
        logger.LogError(
            ex,
            "Failed to delete equipment with ID {EquipmentId}.",
            id
        );

        return Results.Problem(
            title: "Failed to delete equipment",
            detail: "An error occurred while deleting the equipment.",
            statusCode: 500
        );
    }
});



// ============================================
// BORROWING: GET ALL REQUESTS
// ============================================

app.MapGet("/api/borrowings", async (
    IBorrowingRepository repository,
    ILogger<Program> logger) =>
{
    try
    {
        var requests = await repository.GetAllAsync();
        return Results.Ok(requests);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to retrieve borrowing requests.");
        return Results.Problem(
            title: "Failed to retrieve borrowing requests",
            statusCode: 500
        );
    }
});

// ============================================
// BORROWING: SUBMIT NEW REQUEST
// ============================================

app.MapPost("/api/borrowings", async (
    Borrowing borrowing,
    IBorrowingRepository borrowingRepository,
    IEquipmentRepository equipmentRepository,
    ILogger<Program> logger) =>
{
    if (string.IsNullOrWhiteSpace(borrowing.Borrower))
        return Results.BadRequest(new { message = "Borrower name is required." });

    if (!ObjectId.TryParse(borrowing.EquipmentId, out _))
        return Results.BadRequest(new { message = "Invalid equipment ID." });

    if (borrowing.Quantity < 1)
        return Results.BadRequest(new { message = "Quantity must be greater than zero." });

    if (!DateOnly.TryParse(borrowing.BorrowDate, out var borrowDate) ||
        !DateOnly.TryParse(borrowing.ReturnDate, out var returnDate))
        return Results.BadRequest(new { message = "Invalid borrowing or return date." });

    if (returnDate < borrowDate)
        return Results.BadRequest(new { message = "Return date cannot be earlier than borrowing date." });

    try
    {
        var equipment = await equipmentRepository.GetByIdAsync(borrowing.EquipmentId);

        if (equipment == null)
            return Results.NotFound(new { message = "Equipment not found." });

        var pendingRequests = await borrowingRepository.GetAllAsync();

        var reservedQuantity = pendingRequests
            .Where(r => r.EquipmentId == borrowing.EquipmentId && r.Status == "Pending")
            .Sum(r => r.Quantity);

        var available = equipment.AvailableQuantity - reservedQuantity;

        if (borrowing.Quantity > available)
            return Results.BadRequest(new
            {
                message = $"Only {Math.Max(available, 0)} unit(s) are available."
            });

        borrowing.Id = null;
        borrowing.Borrower = borrowing.Borrower.Trim();
        borrowing.Equipment = equipment.Name;
        borrowing.Status = "Pending";
        borrowing.ActualReturnDate = null;

        var saved = await borrowingRepository.AddAsync(borrowing);

        return Results.Created($"/api/borrowings/{saved.Id}", saved);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to save borrowing request.");
        return Results.Problem(
            title: "Failed to save borrowing request",
            statusCode: 500
        );
    }
});

// ============================================
// BORROWING: APPROVE REQUEST
// ============================================

app.MapPut("/api/borrowings/{id}/approve", async (
    string id,
    IBorrowingRepository borrowingRepository,
    IEquipmentRepository equipmentRepository,
    ILogger<Program> logger) =>
{
    if (!ObjectId.TryParse(id, out _))
        return Results.BadRequest(new { message = "Invalid borrowing ID." });

    try
    {
        var request = await borrowingRepository.GetByIdAsync(id);

        if (request == null)
            return Results.NotFound(new { message = "Borrowing request not found." });

        if (request.Status != "Pending")
            return Results.BadRequest(new { message = "Only pending requests can be approved." });

        var equipment = await equipmentRepository.GetByIdAsync(request.EquipmentId);

        if (equipment == null)
            return Results.NotFound(new { message = "Equipment not found." });

        if (equipment.AvailableQuantity < request.Quantity)
            return Results.BadRequest(new { message = "Not enough available equipment." });

        equipment.AvailableQuantity -= request.Quantity;

        var updatedEquipment = await equipmentRepository.UpdateAsync(
            equipment.Id!,
            equipment
        );

        if (updatedEquipment == null)
            return Results.Problem(title: "Failed to update equipment quantity.", statusCode: 500);

        request.Status = "Borrowed";

        var updatedRequest = await borrowingRepository.UpdateAsync(id, request);

        return Results.Ok(updatedRequest);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to approve borrowing request {Id}.", id);
        return Results.Problem(
            title: "Failed to approve borrowing request",
            statusCode: 500
        );
    }
});

// ============================================
// BORROWING: MARK AS RETURNED
// ============================================

app.MapPut("/api/borrowings/{id}/return", async (
    string id,
    IBorrowingRepository borrowingRepository,
    IEquipmentRepository equipmentRepository,
    ILogger<Program> logger) =>
{
    if (!ObjectId.TryParse(id, out _))
        return Results.BadRequest(new { message = "Invalid borrowing ID." });

    try
    {
        var request = await borrowingRepository.GetByIdAsync(id);

        if (request == null)
            return Results.NotFound(new { message = "Borrowing request not found." });

        if (request.Status != "Borrowed")
            return Results.BadRequest(new { message = "Only borrowed equipment can be returned." });

        var equipment = await equipmentRepository.GetByIdAsync(request.EquipmentId);

        if (equipment == null)
            return Results.NotFound(new { message = "Equipment not found." });

        equipment.AvailableQuantity += request.Quantity;

        var updatedEquipment = await equipmentRepository.UpdateAsync(
            equipment.Id!,
            equipment
        );

        if (updatedEquipment == null)
            return Results.Problem(title: "Failed to update equipment quantity.", statusCode: 500);

        request.Status = "Returned";
        request.ActualReturnDate = DateOnly.FromDateTime(DateTime.UtcNow)
            .ToString("yyyy-MM-dd");

        var updatedRequest = await borrowingRepository.UpdateAsync(id, request);

        return Results.Ok(updatedRequest);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to record equipment return {Id}.", id);
        return Results.Problem(
            title: "Failed to record equipment return",
            statusCode: 500
        );
    }
});


// ============================================
// START APPLICATION
// ============================================

app.Run();

// Required for WebApplicationFactory tests
public partial class Program { }
