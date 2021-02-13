

Use to generate a variable number of SQL insert statements.

Input needs to be comma-separated.

Specify table name, constant values (those which do not change from one insert to another), and variable values.

Input is checked - no empty input allowed. The number of inserts is determined by the amount of comma-separated values input into the first variable column. Subsequent variable columns needs to have a matching number of elements.
