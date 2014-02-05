package models;


import models.geo.Sector;
import models.geo.primitives.Length;
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

    @OneToOne(cascade = {CascadeType.ALL})
    public Sector sector;

    public int frequency;

}
