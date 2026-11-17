
using ToolLoop.Api.Models;

namespace ToolLoop.Api.Repositories;

public interface IBorrowingRepository
{
    Task<List<Borrowing>> GetAllAsync();

    Task<Borrowing?> GetByIdAsync(string id);

    Task<Borrowing> AddAsync(Borrowing borrowing);

    Task<Borrowing?> UpdateAsync(string id, Borrowing borrowing);

    Task<bool> DeleteAsync(string id);

    Task PingAsync();
}
