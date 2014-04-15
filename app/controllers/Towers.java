package controllers;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import models.Tower;
import play.Logger;
import play.data.validation.Valid;
import play.mvc.With;

import java.util.List;

/**
 * @author kpestov
 */
public class Towers extends BaseController {

    public static void all() {
        List<Tower> towers = Tower.findAll();
        JsonArray array = new JsonArray();
        for (Tower t : towers) {
            JsonElement el = gson.toJsonTree(t, Tower.class);
            array.add(el);
        }
        renderJSON(array.toString());
    }

    public static void create(@Valid Tower tower) {
        try {
            tower.validateAndCreate();
            renderJSON(String.format("{\"id\":%d}", tower.id));

        } catch (Exception e) {
            Logger.error(e, "Failed to create object Tower. Query: %s", request.querystring);
            error();
        }
    }

    public static void edit(@Valid Tower tower) {
        try {
            tower.validateAndSave();
            ok();

        } catch (Exception e) {
            Logger.error(e, "Failed to edit object Tower. Query: %s", request.querystring);
            error();
        }
    }

    public static void delete(Long id) {
        try{
            Tower t = Tower.findById(id);
            if (t != null){
                t.delete();
                ok();
            } else {
                Logger.info("No tower find to delete. id = " + id);
                badRequest();
            }
        } catch (Exception e){
            Logger.error(e, "Failed to delete object Tower. Query: %s", request.querystring);
            error();
        }
    }


}
