import React from 'react'
import { Button, Modal, ModalContent, ModalOverlay, ModalBody, ModalHeader, ModalCloseButton, ModalFooter, Input, FormControl, FormLabel, useDisclosure } from '@chakra-ui/react'

export default function ModalReg() {
    const { isOpen, onOpen, onClose } = useDisclosure()
  
    const initialRef = React.useRef(null)
    const finalRef = React.useRef(null)
  
    return (
      <>
        <Button onClick={onOpen}>Open Modal</Button>
  
        <Modal
          initialFocusRef={initialRef}
          finalFocusRef={finalRef}
          isOpen={isOpen}
          onClose={onClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Регистрация нового пользователя</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>Логин</FormLabel>
                <Input ref={initialRef} placeholder='Логин' />
              </FormControl>
  
              <FormControl mt={4}>
                <FormLabel>Пароль</FormLabel>
                <Input placeholder='Пароль' />
              </FormControl>
            </ModalBody>
  
            <ModalFooter>
              <Button colorScheme='blue' mr={3}>
                Сохранить
              </Button>
              <Button onClick={onClose}>Отменить</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
}