package models;

import play.db.jpa.Model;

import javax.persistence.Entity;
import javax.persistence.Table;

/**
 * @author kpestov
 */
@Entity
@Table(name = "user_")
public class User extends Model{

    public String login;

    public String password;

    public String comment;

}
