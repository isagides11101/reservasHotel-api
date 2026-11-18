## Proyecto final programacion aplicada 
Proyecto para la gestion de Reservas de un Hotel

## Caso 
API rest que permite la gestionar las reservas de un hotel; Registrar huespedes , 
gestionar Habitaciones por su tipo y estado  (libre, ocupada, limpieza), y reservaciones de varias Habitaciones
los usuarios del sistema (administrador y operador) pueden ingresar por medio de validaciones y permisos segun su rol.

## Integrantes
* Yoseth Alejandro Membreño Hernandez - 20241002654
* José Ernesto Fuentes Montoya - 20212021072
* Kent Said Wood Lerians - 20223030041 

## Tecnologias
NODE.js, express 5 , mysql2

## Reglas de Negocio 
## Reglas de negocio
* La fecha de salida debe ser posterior a la de entrada.
* Una habitación no puede tener dos reservaciones activas con fechas que se cruzan.
* El total de la reservación es la suma de los subtotales (noches × precio por noche) de su detalle.
* Solo el rol admin puede gestionar usuarios, tipos de habitación y reportes.
* Una reservación cancelada o finalizada libera la habitación.