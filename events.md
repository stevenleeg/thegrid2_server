= Grid Events =

== Server ==
These events can be triggered by the client to the server.

GeneRal Events:
 * r.ping - Responds with an r.ping event.
Menu Events:
 * m.getGrids - Triggers an m.newGrid event for each grid available.
 * m.getMaps - Triggers an m.newMap for each map available.
 * m.createGrid - Requires data. Creates a new grid.

== Server ==
These can be called by the server to the client.

GeneRal Events:
 * r.ping - In response to an r.ping from the client
Menu Events:
 * m.createGridSuccess - Called when the creation of a grid is a success
 * m.createGridError - Called when an error has occurred while creating a grid
 * m.newGrid - When a new grid is created.
 * m.newMap - When a new map is available
