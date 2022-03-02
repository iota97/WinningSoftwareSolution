from sell import sell_item
from subprocess import run

def test_succes():
    res = sell_item(10.5)
    assert res >= 0

def test_failure():
    res = sell_item("asd")
    assert res < 0

def test_main_success():
    output = run(["python3.8","./sell.py", "2.50"], capture_output=True).stdout
    assert output[:47] == b'[Adding] Price: 2.50\n[Added] Payment entry id: '
    assert output[output.decode('ascii').index('price'):] == b'price: 2.50\n'

def test_main_fail():
    output = run(["python3.8","./sell.py"], capture_output=True).stdout
    assert output == b'Usage: ./sell.py [price_in_dollars]\n'