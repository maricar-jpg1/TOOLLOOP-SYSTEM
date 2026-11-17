
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ToolLoop.Api.Models;

public class Borrowing
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("Borrower")]
    public string Borrower { get; set; } = string.Empty;

    [BsonElement("EquipmentId")]
    public string EquipmentId { get; set; } = string.Empty;

    [BsonElement("Equipment")]
    public string Equipment { get; set; } = string.Empty;

    [BsonElement("Quantity")]
    public int Quantity { get; set; }

    [BsonElement("BorrowDate")]
    public string BorrowDate { get; set; } = string.Empty;

    [BsonElement("ReturnDate")]
    public string ReturnDate { get; set; } = string.Empty;

    [BsonElement("ActualReturnDate")]
    public string? ActualReturnDate { get; set; }

    [BsonElement("Status")]
    public string Status { get; set; } = "Pending";
}
