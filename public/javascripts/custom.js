window.App = {
    Models: {},
    Collections: {},
    Views: {},
    Router: {}
};


App.Models.ToDo = Backbone.Model.extend({
	urlRoot: "/api/todos/", 
	idAttribute: "_id",
	defaults: {
		id: null,
		mensaje: "Mi super genial tarea",
		finalizado: 0
	}
});

App.Collections.ToDos = Backbone.Collection.extend({
	model: App.Models.Todo,
	url: "/api/todos"
});