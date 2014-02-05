package models.geo;

import models.geo.primitives.Length;
import models.geo.primitives.Point;
import play.db.jpa.Model;

import javax.persistence.Entity;

/**
 * @author kpestov
 */
@Entity
public class Sector extends Model{

    public Point center;

    public Length length;

    public float azimuth;

    public float angle;

    @Override
    public boolean validateAndSave(){
        if (center != null){
            center.validateAndSave();
        } else {
            return false;
        }
        if (length != null){
            length.validateAndSave();
        } else {
            return false;
        }
        return true;
    }

}
