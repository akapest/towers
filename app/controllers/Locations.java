package controllers;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import models.Location;
import play.Logger;
import play.data.validation.Valid;

import java.util.List;

/**
 * @author kpestov
 */
public class Locations extends BaseController {

    public static void all() {
        List<Location> locations = Location.findAll();
        JsonArray array = new JsonArray();
        for (Location f : locations) {
            JsonElement el = gson.toJsonTree(f, Location.class);
            array.add(el);
        }
        renderJSON(array.toString());
    }

    public static void create(@Valid Location location) {
        try {
            location.validateAndCreate();
            renderJSON(String.format("{\"id\":%d}", location.id));

        } catch (Exception e) {
            Logger.error(e, "Failed to create object Location. Query: %s", request.querystring);
            error();
        }
    }

    public static void edit(@Valid Location location) {
        try {
            location.validateAndSave();
            ok();

        } catch (Exception e) {
            Logger.error(e, "Failed to edit object Location. Query: %s", request.querystring);
            error();
        }
    }

    public static void delete(Long id) {
        try{
            Location f = Location.findById(id);
            if (f != null){
                f.delete();
                ok();
            } else {
                Logger.info("No location find to delete. id = " + id);
                badRequest();
            }
        } catch (Exception e){
            Logger.error(e, "Failed to delete object Location. Query: %s", request.querystring);
            error();
        }

    }

}
