
using MongoDB.Driver;
using ToolLoop.Api.Models;

namespace ToolLoop.Api.Repositories;

public class MongoBorrowingRepository : IBorrowingRepository
{
    private readonly IMongoCollection<Borrowing> _borrowings;

    public MongoBorrowingRepository(IConfiguration configuration)
    {
        var connectionString =
            configuration["MongoDB:ConnectionString"]
            ?? throw new InvalidOperationException(
                "MongoDB connection string is missing."
            );

        var client = new MongoClient(connectionString);
        var database = client.GetDatabase("toolLoopDb");

        _borrowings = database.GetCollection<Borrowing>("borrowings");
    }

    public async Task<List<Borrowing>> GetAllAsync()
    {
        return await _borrowings
            .Find(Builders<Borrowing>.Filter.Empty)
            .SortByDescending(item => item.Id)
            .ToListAsync();
    }

    public async Task<Borrowing?> GetByIdAsync(string id)
    {
        return await _borrowings
            .Find(item => item.Id == id)
            .FirstOrDefaultAsync();
    }

    public async Task<Borrowing> AddAsync(Borrowing borrowing)
    {
        borrowing.Id = null;
        await _borrowings.InsertOneAsync(borrowing);
        return borrowing;
    }

    public async Task<Borrowing?> UpdateAsync(
        string id,
        Borrowing borrowing)
    {
        borrowing.Id = id;

        var result = await _borrowings.ReplaceOneAsync(
            item => item.Id == id,
            borrowing
        );

        return result.MatchedCount == 0 ? null : borrowing;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _borrowings.DeleteOneAsync(
            item => item.Id == id
        );

        return result.DeletedCount > 0;
    }

    public async Task PingAsync()
    {
        await _borrowings.Database.RunCommandAsync<MongoDB.Bson.BsonDocument>(
            new MongoDB.Bson.BsonDocument("ping", 1)
        );
    }
}
