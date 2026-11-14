
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using MongoDB.Bson;
using ToolLoop.Api.Models;
using ToolLoop.Api.Tests.Infrastructure;
using Xunit;

namespace ToolLoop.Api.Tests;

public class BackendApiTests
{
    // B-T1: Check API health endpoint
    [Fact]
    public async Task BT1_HealthEndpoint_ReturnsOk()
    {
        using var factory = new ToolLoopWebApplicationFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(content);

        Assert.Equal(
            "ok",
            json.RootElement.GetProperty("status").GetString()
        );
    }

    // B-T2: Retrieve all equipment
    [Fact]
    public async Task BT2_GetEquipment_ReturnsOk()
    {
        using var factory = new ToolLoopWebApplicationFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/equipment");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var equipment = await response.Content
            .ReadFromJsonAsync<List<Equipment>>();

        Assert.NotNull(equipment);
        Assert.Empty(equipment);
    }

    // B-T3: Add valid equipment
    [Fact]
    public async Task BT3_AddEquipment_ReturnsCreated()
    {
        using var factory = new ToolLoopWebApplicationFactory();
        using var client = factory.CreateClient();

        var equipment = new Equipment
        {
            Name = "Test Hammer",
            Category = "Hand Tools",
            Quantity = 3,
            AvailableQuantity = 3,
            Description = "Backend test equipment",
            Status = "Available"
        };

        var response = await client.PostAsJsonAsync(
            "/api/equipment",
            equipment
        );

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var savedEquipment = await response.Content
            .ReadFromJsonAsync<Equipment>();

        Assert.NotNull(savedEquipment);
        Assert.False(string.IsNullOrWhiteSpace(savedEquipment.Id));
        Assert.Equal("Test Hammer", savedEquipment.Name);
    }

    // B-T4: Reject equipment with invalid quantity
    [Fact]
    public async Task BT4_AddEquipment_InvalidQuantity_ReturnsBadRequest()
    {
        using var factory = new ToolLoopWebApplicationFactory();
        using var client = factory.CreateClient();

        var equipment = new Equipment
        {
            Name = "Test Hammer",
            Category = "Hand Tools",
            Quantity = 0,
            Description = "Invalid quantity test"
        };

        var response = await client.PostAsJsonAsync(
            "/api/equipment",
            equipment
        );

        Assert.Equal(
            HttpStatusCode.BadRequest,
            response.StatusCode
        );
    }

    // B-T5: Return not found for missing equipment
    [Fact]
    public async Task BT5_GetMissingEquipment_ReturnsNotFound()
    {
        using var factory = new ToolLoopWebApplicationFactory();
        using var client = factory.CreateClient();

        var missingId = ObjectId.GenerateNewId().ToString();

        var response = await client.GetAsync(
            $"/api/equipment/{missingId}"
        );

        Assert.Equal(
            HttpStatusCode.NotFound,
            response.StatusCode
        );
    }
}
