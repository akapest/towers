package models;

import play.Logger;
import play.db.jpa.Model;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import javax.persistence.Transient;
import java.util.Collection;
import java.util.HashSet;

/**
 * @author kpestov
 */
@Entity
@Table(name = "user_")
public class User extends Model{

    public String login;

    public String password;

    public String comment;

    @ManyToMany
    public Collection<Location> locations_;

    @ElementCollection
    @CollectionTable(name="location_names", joinColumns=@JoinColumn(name="user_id"))
    @Column(name="locations")
    public Collection<String> locations;

    private void addLocation(Location l){
        if (locations_ == null){
            locations_ = new HashSet<Location>();
        }
        locations_.add(l);
    }

    public void setLocations(Collection<String> locations){
        for (String name : locations){
            Location l = Location.find("byName", name).first();
            if (l != null){
                this.addLocation(l);
            } else {
                Logger.error("Location with id %d not found");
            }
        }
        this.locations = locations;
    }

    public Collection<String> getLocations(){
        Collection<String> result = new HashSet<String>();
        for (Location l : locations_){
            result.add(l.name);
        }
        return result;
    }

}
