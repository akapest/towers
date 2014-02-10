package models;

import play.data.validation.Max;
import play.data.validation.Min;
import play.db.jpa.Model;

import javax.persistence.Entity;

/**
 * @author kpestov
 */
@Entity
public class Point extends Model {

    @Min(-90)
    @Max(90)
    public float latitude;

    @Min(-180)
    @Max(180)
    public float longitude;

}
