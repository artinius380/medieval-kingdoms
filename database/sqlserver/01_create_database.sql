-- ============================================================
-- MEDIEVAL KINGDOMS - SQL SERVER
-- 01: CREAR BASE DE DATOS
-- Ejecutar en SSMS o Azure Data Studio (F5)
-- ============================================================

IF DB_ID(N'medieval_kingdoms') IS NULL
    CREATE DATABASE medieval_kingdoms;
GO

USE medieval_kingdoms;
GO
