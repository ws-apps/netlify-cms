import Ember from 'ember';
import AuthenticatedRoute from './authenticated';
import Entry from '../models/entry';



export default AuthenticatedRoute.extend({
  _pathFor: function(collection, slug) {
    return collection.folder + "/" + slug + ".md";
  },

  serialize: function(model) {
    return {
      collection_id: model.get("_collection.id"),
      slug: (model.get("_path") || "").split("/").pop().replace(/\.[^.]+$/, '')
    };
  },

  model: function(params) {
    console.log("Finding model: %o", params);
    var collection = this.get("config").findCollection(params.collection_id);
    var path = this._pathFor(collection, params.slug);
    return this.get("repository").readFile(path).then(function(content) {
      return Entry.fromContent(collection, content, path);
    }.bind(this));
  },

  controllerName: "entry",
  setupController: function(controller, model) {
    this._super();
    this.collection = model._collection;
    controller.prepare(this.collection, model);
  },

  actions: {
    save: function() {
      console.log(this.get("controller").toFileContent());
      this.get("repository").updateFiles({
        files: [{path: this.model._path, content: this.get("controller").toFileContent()}],
        message: "Updated " + this.get("controller.collection.label") + " " + this.get("controller.entry.title")
      }).then(function() {
        console.log("Done!");
      });
    }
  }
});
