
# ============================================
# BUILD STAGE
# ============================================

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY ["ToolLoop.Api.csproj", "./"]

RUN dotnet restore "ToolLoop.Api.csproj"

COPY . .

RUN dotnet publish "ToolLoop.Api.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# ============================================
# RUNTIME STAGE
# ============================================

FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 10000

ENTRYPOINT ["dotnet", "ToolLoop.Api.dll"]
