package controllers;

import play.Play;
import play.Logger;
import play.exceptions.UnexpectedException;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.results.RenderTemplate;
import play.mvc.results.RenderText;
import play.mvc.results.Result;
import play.templates.Template;
import play.templates.TemplateLoader;
import play.vfs.VirtualFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;

/**
 * @author kpestov
 */
public class Templates extends BaseController {

    public static void get(String name) {
        Template template = TemplateLoader.load("app/views/templates/"  + name);
        HashMap<String, Object> params = new HashMap<String, Object>(0);
        params.put("isAdmin", isAdmin());
        String result = new RenderTemplate(template, params).getContent();
        throw new RenderText(result);
    }

    private static String getTemplate(String name){
        Template template = TemplateLoader.load("app/views/templates/"  + name);
        HashMap<String, Object> params = new HashMap<String, Object>(0);
        params.put("isAdmin", isAdmin());
        String result = new RenderTemplate(template, params).getContent();
        return result;
    }

    public static String[] getAll() {
        String[] list = Play.getFile("app/views/templates").list();
        return list;
    }

}
