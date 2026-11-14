
using ToolLoop.Api.Models;

namespace ToolLoop.Api.Repositories;

public interface IEquipmentRepository
{
    Task<List<Equipment>> GetAllAsync();

    Task<Equipment?> GetByIdAsync(string id);

    Task<Equipment> AddAsync(Equipment equipment);

    Task<Equipment?> UpdateAsync(string id, Equipment equipment);

    Task<bool> DeleteAsync(string id);

    Task PingAsync();
}
