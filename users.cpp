#include <iostream>
#include <string>
#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/statement.h>
#include <sodium.h>
#include <cppconn/prepared_statement.h>
#include <vector>
#include <fstream>
#include <stdexcept>
#include <tuple>

std::tuple<std::string, std::string, std::string, std::string> read_db_config(const std::string& file_path) {
    std::ifstream config_file(file_path);

    if (!config_file.is_open()) {
        throw std::runtime_error("Could not open the configuration file");
    }

    std::string host, user, password, schema;
    std::getline(config_file, host);
    std::getline(config_file, user);
    std::getline(config_file, password);
    std::getline(config_file, schema);

    return std::make_tuple(host, user, password, schema);
}

std::string hashPassword(const std::string& password) {
    if (sodium_init() == -1) {
        throw std::runtime_error("libsodium initialization failed.");
    }

    const size_t HASH_LEN = crypto_pwhash_STRBYTES;
    char hash[HASH_LEN];

    if (crypto_pwhash_str(
        hash,                  // buffer to store hash
        password.c_str(),      // password to hash
        password.length(),     // length of password
        crypto_pwhash_OPSLIMIT_INTERACTIVE,  // computational cost
        crypto_pwhash_MEMLIMIT_INTERACTIVE   // memory cost
    ) != 0) {
        throw std::runtime_error("Password hashing failed.");
    }

    return std::string(hash);
}

int main() {
    // Connecte à la base de données
    auto [host, user, password, schema] = read_db_config("db_config.txt");
    sql::mysql::MySQL_Driver *raw_driver = sql::mysql::get_mysql_driver_instance();
    std::unique_ptr<sql::Connection> con(raw_driver->connect(host, user, password));
    con->setSchema(schema);

    // Saisit les informations de l'utilisateur
    std::string email, password;
    std::cout << "Veuillez saisir l'email de l'utilisateur : ";
    std::cin >> email;
    std::cout << "Veuillez saisir le mot de passe de l'utilisateur : ";
    std::cin >> password;

    // Insère l'utilisateur dans la base de données
    std::unique_ptr<sql::PreparedStatement> stmt(con->prepareStatement("INSERT INTO users (email, password) VALUES (?, ?)"));
    stmt->setString(1, email);
    stmt->setString(2, hashPassword(password));
    stmt->execute();

    std::cout << "Utilisateur ajouté avec succès !" << std::endl;

    delete raw_driver;

    return 0;
}
