# Etapa de construcción
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar el archivo de proyecto y restaurar dependencias
COPY ["BasketballScoreboardAPI.csproj", "./"]
RUN dotnet restore "BasketballScoreboardAPI.csproj"

# Copiar el resto del código
COPY . .

# Publicar la aplicación
RUN dotnet publish "BasketballScoreboardAPI.csproj" -c Release -o /app/publish

# Etapa de tiempo de ejecución
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copiar la aplicación publicada
COPY --from=build /app/publish .

# Exponer el puerto 80
EXPOSE 80

# Comando de inicio
ENTRYPOINT ["dotnet", "BasketballScoreboardAPI.dll"]
