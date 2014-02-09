package models.geo;

import models.geo.primitives.Point;
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

    public Point center;

    public float radius;

}
