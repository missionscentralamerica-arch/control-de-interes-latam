-- Script manual de migración para MySQL
-- Ejecuta este bloque sobre la base existente para añadir los campos nuevos
-- de teléfono, iglesia y voluntario cuando aún no existan en personas.

USE iglesia_registro;

drop procedure if exists add_personas_report_columns;

delimiter $$
create procedure add_personas_report_columns()
begin
  declare telefono_exists int default 0;
  declare iglesia_exists int default 0;
  declare voluntario_exists int default 0;

  select count(*) into telefono_exists
  from information_schema.columns
  where table_schema = database()
    and table_name = 'personas'
    and column_name = 'telefono';

  if telefono_exists = 0 then
    alter table personas add column telefono varchar(50) null after correo;
  end if;

  select count(*) into iglesia_exists
  from information_schema.columns
  where table_schema = database()
    and table_name = 'personas'
    and column_name = 'iglesia';

  if iglesia_exists = 0 then
    alter table personas add column iglesia varchar(150) null after evento_descripcion;
  end if;

  select count(*) into voluntario_exists
  from information_schema.columns
  where table_schema = database()
    and table_name = 'personas'
    and column_name = 'voluntario';

  if voluntario_exists = 0 then
    alter table personas add column voluntario varchar(150) null after iglesia;
  end if;
end$$
delimiter ;

call add_personas_report_columns();
drop procedure add_personas_report_columns;

-- Si la base ya tiene los tres campos, el procedimiento no intenta volver a crear columnas.
-- Los campos del reporte actual siguen siendo: codigo_postal, edad, evento_descripcion,
-- reconciliacion, aceptar_cristo y ahora además iglesias/voluntario como columnas de seguimiento.
