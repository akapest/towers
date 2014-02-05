package models.geo;

import models.geo.primitives.Point;
import play.db.jpa.Model;

import javax.persistence.Entity;

/**
 * "Отрезок".
 *
 * @author kpestov
 */
@Entity
public class Line extends Model {

    Point start;
    Point end;
}
