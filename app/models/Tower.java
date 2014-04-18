package models;


import play.data.validation.Required;
import play.data.validation.Valid;
import play.db.jpa.JPABase;
import play.db.jpa.Model;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Transient;

/**
 * @author kpestov
 */
@Entity
public class Tower extends Model {

    public String name;

    public String angle;

    public float freq;

    @Required
    @OneToOne(cascade = CascadeType.ALL)
    public Point start;
    @OneToOne(cascade = CascadeType.ALL)
    public Point end;  //только для точки-точки. считаем одной вышкой

    public float radius;
    public float azimuth;

    @ManyToOne(fetch = FetchType.LAZY)
    public Location location;

    public transient Long locationId;

    public void setLocationId(Long id){
        this.location = Location.findById(id);
    }

}
