namespace ToolLoop.Api.Data;

public class MongoDBSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = "toolLoopDb";
}