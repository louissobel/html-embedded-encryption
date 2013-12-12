import json
import getpass
import os
from encryption import rsa

class CredentialConfigManager(object):
    """
    parses .config file in root for info about files
    
    {
        personal_keys: {
            public: public key,
            private: private key,
        },
        default_password : used if per-file password or key pair can't be,
        files : {
            file_pathname : {
                password : aes key,
                public_keys : list of public keys to encrypt with, excluding own
            }
        }
    }

    .config should be instantiated with personal_keys, public/private key, default_password, empty files
    """
    def __init__(self, root, config_pathname):
        self.pathname = config_pathname
        self.refresh_config_file()

    def parse_config_file(self, contents):
        """
        reads in above json object. also can be used to refresh
        todo: when to refresh? ask louis, but for now just do it before every get call
        """
        self.config = json.loads(contents)

    def refresh_config_file(self):
        with open(self.pathname, 'r') as f:
            config_contents = f.read()
        self.parse_config_file(config_contents)

    def write_config_file(self):
        config_json = json.dumps(self.config)
        with open(self.pathname, 'w') as f:
            f.write(config_json)

    def file_creds_for(self, path):
        return {
            "rsa_key_pair" : (self.get_public_key(), self.get_private_key()),
            "default_password" : self.get_default_password(),
            "password" : self.get_password_for(path),
            "public_keys" : self.get_public_keys_for(path),
        }

    def get_public_key(self):
        keys = self.config.get("personal_keys")
        if keys is not None:
            return keys["public"]

    def get_private_key(self):
        keys = self.config.get("personal_keys")
        if keys is not None:
            return keys["private"]

    def get_default_password(self):
        return self.config["default_password"]

    def get_files(self):
        return self.config["files"]


    def get_password_for(self, cryptbox_pathname):
        """
        returns password for a given pathname if there is one
        but public/private keys should always be tried first
        """
        file_config = self.files.get(cryptbox_pathname, {})
        return file_config.get("password", None)

    def get_public_keys_for(self, cryptbox_pathname):
        """
        return list of public keys for sharing, the identities authorized to the file
        """
        file_config = self.files.get(cryptbox_pathname, {})
        return file_config.get("public_keys", [])

    def set_password_for(self, cryptbox_pathname):
        password = getpass.getpass()
        if cryptbox_pathname in self.config.files:
            file_config = self.files[cryptbox_pathname]
            file_config["password"] = password
        else:
            file_config = {
                "password" : password,
            }
        self.get_files()[cryptbox_pathname] = file_config
        self.write_config_file()

    def set_public_keys_for(self, cryptbox_pathname, public_keys):
        if cryptbox_pathname in self.config.files:
            file_config = self.files[cryptbox_pathname]
            file_config["public_keys"] = public_keys
        else:
            file_config = {
                "public_keys" : public_keys,
            }
        self["files"][cryptbox_pathname] = file_config
        self.write_config_file()

    def set_new_rsa_keypair(self):
        keys = self["personal_keys"]
        keys["private"], keys["public"] = rsa.generate_keypair()
        self.write_config_file()

    def set_default_password(self, password):
        self.config["default_password"] = password
        self.write_config_file()
   