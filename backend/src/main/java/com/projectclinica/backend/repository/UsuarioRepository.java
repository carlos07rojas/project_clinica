package com.projectclinica.backend.repository;

import com.projectclinica.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository // esta interfaz es un componente de acceso a datos
public interface UsuarioRepository
    // Jpa hace dos cosas primero que este Repository trabaja con la clase Usuario. Segundo que el tipo de dato de su clave primaria es Integer
    extends JpaRepository<Usuario, Integer> {
    // "Optional" representa un valor que puede existir o no | campo unico
    // "findBy" esto representa de una manera mas simplicada que es una busqueda, es una representacion mas corta de una consulta SQL "Email" representa el campo que se busca 
    Optional<Usuario> findByEmail(String email); //esto permite buscar al usuario por el email

    // java.util es un paquete y subpaquete que contiene herramientas como List
    java.util.List<Usuario> findByRol(String rol);// se utliliza List cuando hay muchos de un mismo tipo

    // verifica si existe un email (para validar duplicados)
    boolean existsByEmail(String email);
} 
