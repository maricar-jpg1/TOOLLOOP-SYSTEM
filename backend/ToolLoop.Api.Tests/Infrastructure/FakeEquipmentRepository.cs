
using MongoDB.Bson;
using ToolLoop.Api.Models;
using ToolLoop.Api.Repositories;

namespace ToolLoop.Api.Tests.Infrastructure;

public class FakeEquipmentRepository : IEquipmentRepository
{
    private readonly List<Equipment> _equipment = new();

    public Task<List<Equipment>> GetAllAsync()
    {
        return Task.FromResult(_equipment.ToList());
    }

    public Task<Equipment?> GetByIdAsync(string id)
    {
        var equipment = _equipment.FirstOrDefault(item => item.Id == id);
        return Task.FromResult(equipment);
    }

    public Task<Equipment> AddAsync(Equipment equipment)
    {
        equipment.Id = ObjectId.GenerateNewId().ToString();

        _equipment.Add(equipment);

        return Task.FromResult(equipment);
    }

    public Task<Equipment?> UpdateAsync(string id, Equipment equipment)
    {
        var index = _equipment.FindIndex(item => item.Id == id);

        if (index < 0)
        {
            return Task.FromResult<Equipment?>(null);
        }

        _equipment[index] = equipment;

        return Task.FromResult<Equipment?>(equipment);
    }

    public Task<bool> DeleteAsync(string id)
    {
        var equipment = _equipment.FirstOrDefault(item => item.Id == id);

        if (equipment == null)
        {
            return Task.FromResult(false);
        }

        _equipment.Remove(equipment);

        return Task.FromResult(true);
    }

    public Task PingAsync()
    {
        return Task.CompletedTask;
    }
}
