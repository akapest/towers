package models;

import play.db.jpa.Model;

import javax.persistence.Entity;

/**
 * @author kpestov
 */
@Entity
public class Freq extends Model {

    public String color;
    public float value;

}
