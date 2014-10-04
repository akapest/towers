package controllers;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import models.TowerPoint;
import play.Logger;
import play.data.validation.Valid;

import java.util.List;

/**
 * @author kpestov
 */
public class Points extends BaseController {

    public static void all() {
        List<TowerPoint> points = TowerPoint.findAll();
        JsonArray array = new JsonArray();
        for (TowerPoint t : points) {
            JsonElement el = gson.toJsonTree(t, TowerPoint.class);
            array.add(el);
        }
        renderJSON(array.toString());
    }

    public static void byId(Long id) {
        TowerPoint point = TowerPoint.findById(id);
        renderJSON(gson.toJsonTree(point, TowerPoint.class).toString());
    }

    public static void create(@Valid TowerPoint point) {
        try {
            point.create();
            renderJSON(String.format("{\"id\":%d}", point.id));

        } catch (Exception e) {
            Logger.error(e, "Failed to create object TowerPoint. Query: %s", request.querystring);
            error();
        }
    }

    public static void edit(@Valid TowerPoint point) {
        try {
            point.save();
            ok();

        } catch (Exception e) {
            Logger.error(e, "Failed to edit object TowerPoint. Query: %s", request.querystring);
            error();
        }
    }

    public static void delete(Long id) {
        try{
            TowerPoint t = TowerPoint.findById(id);
            if (t != null){
                t.delete();
                ok();
            } else {
                Logger.info("No tower find to delete. id = " + id);
                badRequest();
            }
        } catch (Exception e){
            Logger.error(e, "Failed to delete object TowerPoint. Query: %s", request.querystring);
            error();
        }
    }


}
