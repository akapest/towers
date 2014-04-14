package models;

import play.data.validation.Unique;
import play.db.jpa.Model;

import javax.persistence.Entity;

/**
 * Локация, например, Верхотурье
 * <p/>
 * Простая - описывается центром и радиусом.
 *
 * @author kpestov
 */
@Entity
public class Location extends Model {

    @Unique
    public String name;

    public String comment;

    public String color;

    public Point center;

    public float radius;

}
