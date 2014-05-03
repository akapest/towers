package models;

import play.data.validation.Required;
import play.data.validation.Unique;
import play.db.jpa.Model;

import javax.persistence.*;
import java.io.UnsupportedEncodingException;
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

    @Required
    @OneToOne(cascade = CascadeType.ALL)
    public Point start;

    public float radius;

    @OneToMany(mappedBy="location")
    public Collection<Tower> towers;

    @ManyToMany(mappedBy = "locations_")
    public Collection<User> users;

    @Override
    public Location delete(){
        for (User u : users){
            u.removeLocation(this);
            u.save();
        }
        return super.delete();
    }

}
