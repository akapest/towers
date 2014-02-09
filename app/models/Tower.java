package models;


import models.geo.primitives.Point;
import play.db.jpa.Model;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.OneToOne;

/**
 * @author kpestov
 */
@Entity
public class Tower extends Model {

    public String name;

    public float angle;

    public float freq;

    @OneToOne
    public Point start;
    @OneToOne
    public Point end;  //только для точки. считаем две антенны одной вышкой

    public float radius;
    public float azimuth;

    @Override
    public boolean validateAndSave(){
        if (start != null){
            start.validateAndSave();
        } else {
            return false;
        }
        if (end != null){
            end.validateAndSave();
        }
        this.save();
        return true;
    }

    @Override
    public boolean validateAndCreate(){
        if (start != null){
            start.validateAndCreate();
        } else {
            return false;
        }
        if (end != null){
            end.validateAndCreate();
        }
        super.create();
        return true;
    }


}
