
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ToolLoop.Api.Models;

public class Equipment
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("Name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("Category")]
    public string Category { get; set; } = string.Empty;

    [BsonElement("Quantity")]
    public int Quantity { get; set; }

    [BsonElement("AvailableQuantity")]
    public int AvailableQuantity { get; set; }

    [BsonElement("Description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("Status")]
    public string Status { get; set; } = "Available";
}
