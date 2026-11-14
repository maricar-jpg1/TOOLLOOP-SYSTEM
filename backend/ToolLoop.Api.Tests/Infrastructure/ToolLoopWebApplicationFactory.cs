
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using ToolLoop.Api.Repositories;

namespace ToolLoop.Api.Tests.Infrastructure;

public class ToolLoopWebApplicationFactory
    : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IEquipmentRepository>();

            services.AddSingleton<IEquipmentRepository>(
                new FakeEquipmentRepository()
            );
        });
    }
}
