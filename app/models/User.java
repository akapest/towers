package models;

import play.Logger;
import play.db.jpa.Model;

import javax.persistence.*;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

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
    public Set<String> locations;

    private void addLocation(Location l){
        if (locations_ == null){
            locations_ = new HashSet<Location>();
        }
        locations_.add(l);
    }

    public void setLocations(Set<String> locations){
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

    public void removeLocation(Location location) {
        this.locations_.remove(location);
        this.locations = new HashSet<String>();
        for (Location l : locations_){
            this.locations.add(l.name);
        }
    }
}
