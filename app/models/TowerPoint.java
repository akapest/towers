package models;

import play.data.validation.Required;
import play.db.jpa.Model;

import javax.persistence.*;

/**
 * Точка на карте, привязанная к вышке.
 *
 * created at 10/3/14 5:24 PM
 */
@Entity
public class TowerPoint extends Model {

    public String name;

    @Required
    @OneToOne(cascade = CascadeType.ALL)
    public Point start;

    public float radius;

    public Long locationId;

    public Long towerId;

    // this is for validation only
    @ManyToOne(fetch = FetchType.LAZY)
    public transient Location location;
    public void setLocationId(Long id){
        this.locationId = id;
        this.location = Location.findById(id);
    }

    @ManyToOne(fetch = FetchType.LAZY)
    public transient Tower tower;
    public void setTowerId(Long id){
        this.towerId = id;
        this.tower = Tower.findById(id);
    }




}
