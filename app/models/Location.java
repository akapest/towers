package models;

import play.data.validation.Required;
import play.data.validation.Unique;
import play.db.jpa.Model;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import java.util.Collection;

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

    @Required
    @OneToOne(cascade = CascadeType.ALL)
    public Point start;

    public float radius;

    @OneToMany(mappedBy="location")
    public Collection<Tower> towers;

}
