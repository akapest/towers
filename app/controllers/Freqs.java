package controllers;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import models.Freq;
import play.Logger;
import play.data.validation.Valid;
import play.mvc.Controller;
import play.mvc.With;

import java.util.List;

/**
 * @author kpestov
 */
@With(Secure.class)
public class Freqs extends Controller {

    private static Gson gson = new Gson();

    public static void all() {
        List<Freq> freqs = Freq.findAll();
        JsonArray array = new JsonArray();
        for (Freq f : freqs) {
            JsonElement el = gson.toJsonTree(f, Freq.class);
            array.add(el);
        }
        renderJSON(array.toString());
    }

    public static void create(@Valid Freq freq) {
        try {
            freq.validateAndCreate();
            renderJSON(String.format("{\"id\":%d}", freq.id));

        } catch (Exception e) {
            Logger.error(e, "Failed to create object Freq. Query: %s", request.querystring);
            error();
        }
    }

    public static void edit(@Valid Freq freq) {
        try {
            freq.validateAndSave();
            ok();

        } catch (Exception e) {
            Logger.error(e, "Failed to edit object Freq. Query: %s", request.querystring);
            error();
        }
    }

    public static void delete(Long id) {
        try{
            Freq f = Freq.findById(id);
            if (f != null){
                f.delete();
                ok();
            } else {
                Logger.info("No freq find to delete. id = " + id);
                badRequest();
            }
        } catch (Exception e){
            Logger.error(e, "Failed to delete object Freq. Query: %s", request.querystring);
            error();
        }

    }


}
