(function () {
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
			_id: null,
			mensaje: "Mi super genial tarea",
			finalizado: 0
		}
	});

	App.Collections.ToDos = Backbone.Collection.extend({
		model: App.Models.ToDo,
		url: "/api/todos"
	});

	App.Collections.todos = new App.Collections.ToDos;
	console.log(App.Collections.todos);
	App.Collections.todos.fetch();
})()