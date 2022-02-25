from sell import sell_item

def test_succes():
    res = sell_item(10.5)
    assert res >= 0

def test_failure():
    res = sell_item("asd")
    assert res < 0