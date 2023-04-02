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
#include "utils.h"
#include <termios.h>

std::string host, user, password, schema, secret;

std::string hashPassword(const std::string& password) {
    if (sodium_init() == -1) {
        throw std::runtime_error("libsodium initialization failed.");
    }

    const size_t HASH_LEN = crypto_pwhash_STRBYTES;
    char hash[HASH_LEN];

    if (crypto_pwhash_str(
        hash,                 
        password.c_str(),     
        password.length(),    
        crypto_pwhash_OPSLIMIT_INTERACTIVE,  
        crypto_pwhash_MEMLIMIT_INTERACTIVE   
    ) != 0) {
        throw std::runtime_error("Password hashing failed.");
    }

    return std::string(hash);
}

bool emailExists(sql::Connection* con, const std::string& email) {
    std::unique_ptr<sql::PreparedStatement> stmt(con->prepareStatement("SELECT COUNT(*) FROM users WHERE email = ?"));
    stmt->setString(1, email);

    std::unique_ptr<sql::ResultSet> res(stmt->executeQuery());

    res->next();
    return res->getInt(1) > 0;
}

std::string read_password() {
    termios oldt, newt;
    std::string password;

    // Turn off echoing of characters on the terminal
    tcgetattr(STDIN_FILENO, &oldt);
    newt = oldt;
    newt.c_lflag &= ~ECHO;
    tcsetattr(STDIN_FILENO, TCSANOW, &newt);

    // Read the password
    std::cin >> password;

    // Restore the terminal settings
    tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
    std::cout << std::endl;

    return password;
}

int main() {
    std::tie(host, user, password, schema, secret) = read_config("config.txt");
    sql::mysql::MySQL_Driver *raw_driver = sql::mysql::get_mysql_driver_instance();
    std::unique_ptr<sql::Connection> con(raw_driver->connect(host, user, password));
    con->setSchema(schema);

    std::string email, password;
    std::cout << "Please enter the user's email: ";
    std::cin >> email;
    while (emailExists(con.get(), email)) {
        std::cout << "This email is already taken. Please enter a new email: ";
        std::cin >> email;
    }

    std::cout << "Please enter the user's password: ";
    password = read_password();

    std::unique_ptr<sql::PreparedStatement> stmt(con->prepareStatement("INSERT INTO users (email, password) VALUES (?, ?)"));
    stmt->setString(1, email);
    stmt->setString(2, hashPassword(password));
    stmt->execute();

    std::cout << "User added successfully!" << std::endl;
    
    return 0;
}
