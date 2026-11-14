
using MongoDB.Bson;
using ToolLoop.Api.Models;
using ToolLoop.Api.Repositories;

var builder = WebApplication.CreateBuilder(args);

// ============================================
// REGISTER REPOSITORY
// ============================================

builder.Services.AddScoped<IEquipmentRepository, MongoEquipmentRepository>();

// ============================================
// CORS CONFIGURATION
// ============================================

var allowedOrigins = new[]
{
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://toolloop-system.netlify.app"
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

// Also support the standard /health path
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

app.MapGet("/api/db-test", async (IEquipmentRepository repository) =>
{
    try
    {
        await repository.PingAsync();

        return Results.Ok(new
        {
            status = "Connected",
            database = "toolLoopDb"
        });
    }
    catch (Exception)
    {
        return Results.Problem(
            title: "MongoDB connection failed",
            detail: "Unable to connect to the database. Check the server configuration.",
            statusCode: 500
        );
    }
});

// ============================================
// GET ALL EQUIPMENT
// ============================================

app.MapGet("/api/equipment", async (IEquipmentRepository repository) =>
{
    try
    {
        var equipment = await repository.GetAllAsync();

        return Results.Ok(equipment);
    }
    catch (Exception)
    {
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
    IEquipmentRepository repository) =>
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
    catch (Exception)
    {
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
    IEquipmentRepository repository) =>
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
    catch (Exception)
    {
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
    IEquipmentRepository repository) =>
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
    catch (Exception)
    {
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
    IEquipmentRepository repository) =>
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
    catch (Exception)
    {
        return Results.Problem(
            title: "Failed to delete equipment",
            detail: "An error occurred while deleting the equipment.",
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
