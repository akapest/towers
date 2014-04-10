package controllers;

import play.Play;
import play.exceptions.UnexpectedException;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.results.RenderText;
import play.mvc.results.Result;
import play.vfs.VirtualFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringWriter;

/**
 * @author kpestov
 */
public class Templates extends Controller {

    public static void get(String name) {
        File file = Play.getFile("app/templates/" + name);
        InputStream is = null;
        try {
            is = new FileInputStream(file);
            StringWriter result = new StringWriter();
            PrintWriter out = new PrintWriter(result);
            BufferedReader reader = new BufferedReader(new InputStreamReader(is, "utf-8"));
            String line = null;
            while ((line = reader.readLine()) != null) {
                out.println(line);
            }
            throw new RenderText(result.toString());

        } catch (IOException e) {
            throw new UnexpectedException(e);
        } finally {
            if (is != null) {
                try {
                    is.close();
                } catch (Exception e) {
                    //
                }
            }

        }

    }

}
