package models;

import play.data.validation.Unique;
import play.db.jpa.Model;

import javax.persistence.Entity;

/**
 * @author kpestov
 */
@Entity
public class Freq extends Model {

    public String color;

    @Unique
    public float value;

}
