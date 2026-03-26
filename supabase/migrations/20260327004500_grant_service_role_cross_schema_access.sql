grant usage on schema public, billing, ops, private to service_role;

grant select, insert, update, delete on all tables in schema public to service_role;
grant select, insert, update, delete on all tables in schema billing to service_role;
grant select, insert, update, delete on all tables in schema ops to service_role;
grant select, insert, update, delete on all tables in schema private to service_role;

grant usage, select on all sequences in schema public to service_role;
grant usage, select on all sequences in schema billing to service_role;
grant usage, select on all sequences in schema ops to service_role;
grant usage, select on all sequences in schema private to service_role;

grant execute on all functions in schema public to service_role;
grant execute on all functions in schema billing to service_role;
grant execute on all functions in schema ops to service_role;
grant execute on all functions in schema private to service_role;

alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema billing grant select, insert, update, delete on tables to service_role;
alter default privileges in schema ops grant select, insert, update, delete on tables to service_role;
alter default privileges in schema private grant select, insert, update, delete on tables to service_role;

alter default privileges in schema public grant usage, select on sequences to service_role;
alter default privileges in schema billing grant usage, select on sequences to service_role;
alter default privileges in schema ops grant usage, select on sequences to service_role;
alter default privileges in schema private grant usage, select on sequences to service_role;

alter default privileges in schema public grant execute on functions to service_role;
alter default privileges in schema billing grant execute on functions to service_role;
alter default privileges in schema ops grant execute on functions to service_role;
alter default privileges in schema private grant execute on functions to service_role;
