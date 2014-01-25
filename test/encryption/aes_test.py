"""
basic check on a core_encryption roundtrip
"""
from encryption import aes

def test_roundtrip():
    message = "sdfkjl 3209oij \x03 sdlfkj \x34 dlfkj FOOBAR wekhj lalal pooop"
    password = 'poop'
    assert message == aes.decrypt(
        aes.encrypt(message, password),
        password
    )

def test_chunksize():
    """
    roundtrip works when message is chunk size aligned
    """
    message = 'o' * aes.CHUNK_SIZE
    password = 'poop'
    assert message == aes.decrypt(
        aes.encrypt(message, password),
        password
    )

def test_blocksize():
    """
    roundtrip works when message is block size aligned
    """
    message = 'o' * aes.BLOCK_SIZE * 7
    password = 'doop'
    assert message == aes.decrypt(
        aes.encrypt(message, password),
        password
    )
